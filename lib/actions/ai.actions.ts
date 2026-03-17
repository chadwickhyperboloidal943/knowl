'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { connectToDatabase } from "@/database/mongoose";
import Book from "@/database/models/book.model";
import BookSegment from "@/database/models/book-segment.model";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

const isGeminiQuotaError = (error: unknown) => {
    const msg = error instanceof Error ? error.message : String(error ?? "");
    return msg.includes("429") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("too many requests");
};

const buildFallbackInsights = (title: string, author: string, segments: string[]) => {
    const sample = segments.filter(Boolean).slice(0, 8);
    const bullets = sample.slice(0, 5).map((s) => {
        const trimmed = s.replace(/\s+/g, " ").trim();
        return `- ${trimmed.slice(0, 160)}${trimmed.length > 160 ? "..." : ""}`;
    });

    const insights = [
        `# ${title}`,
        `A quick local summary for ${author}.`,
        "",
        "The AI quota is currently exhausted, so this snapshot is generated from your extracted node content.",
        "",
        "## Key Excerpts",
        ...(bullets.length ? bullets : ["- Content extracted successfully, but no concise excerpt preview is currently available."]),
    ].join("\n");

    const knowledgeMap = [
        "mindmap",
        `  \"${title}\"`,
        "    \"Core Ideas\"",
        "    \"Examples\"",
        "    \"Applications\"",
        "    \"Open Questions\"",
    ].join("\n");

    const flashcards = [
        { question: `What is the primary focus of ${title}?`, answer: "Identify the central argument or purpose described in the excerpts.", hint: "Look for recurring concepts and themes." },
        { question: "Which idea appears most frequently?", answer: "The most repeated concept is usually a core theme.", hint: "Scan repeated terms in the excerpt list." },
        { question: "What practical use is suggested?", answer: "Map at least one concept to a real scenario or workflow.", hint: "Find examples with action verbs." },
        { question: "What assumption does the text rely on?", answer: "Most arguments rest on an unstated premise you can test.", hint: "Ask: what must be true for this to hold?" },
        { question: "What should be verified next?", answer: "Validate claims with a second source or experiment.", hint: "Turn one claim into a testable question." },
    ];

    return { insights, knowledgeMap, flashcards };
};

export const generateBookInsights = async (bookId: string) => {
    try {
        await connectToDatabase();
        
        const book = await Book.findById(bookId);
        if (!book) throw new Error("Book not found");

        if (book.insights && book.knowledgeMap && book.flashcards && book.flashcards.length > 0) {
            return { success: true, insights: book.insights, knowledgeMap: book.knowledgeMap, flashcards: book.flashcards };
        }

        // Fetch up to 20 segments to get the gist of the book
        const segments = await BookSegment.find({ bookId }).limit(20).lean();
        const textContent = segments.map(s => s.content).join("\n\n");

        if (!textContent) {
            return { success: false, error: "No book content available to analyze" };
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
        Analyze the following text excerpts from the book "${book.title}" by ${book.author}.
        Please provide three things in strict JSON format:
        1. "insights": A captivating, multi-paragraph markdown string summarizing the book's core themes, main takeaways, and general overview.
        2. "knowledgeMap": A Mermaid.js mindmap diagram string. 
           STRICT RULES:
           - Start with "mindmap" keyword.
           - Every single node label MUST be wrapped in double quotes. 
           - NO shapes like root(( )), node( ), or node(( )). ONLY quotes.
           - NO code snippets, NO function-like artifacts.
           - Use 2-space indentation for hierarchy.
        3. "flashcards": An array of 10 interactive flashcards. Each object MUST have:
           - "question": The challenge.
           - "answer": The explanation.
           - "hint": A subtle clue to help the user without giving it away.
        
        Example JSON:
        {
           "insights": "# Overview...",
           "knowledgeMap": "mindmap\\n  \\"Root\\"\\n    \\"Branch 1\\"\\n      \\"Leaf 1\\"",
           "flashcards": [
               { "question": "?", "answer": "!", "hint": "..." }
           ]
        }
        
        Excerpts:
        ${textContent.slice(0, 30000)}
        `;

        let response = "";
        try {
            const result = await model.generateContent(prompt);
            response = result.response.text();
        } catch (modelError) {
            if (isGeminiQuotaError(modelError)) {
                console.error("[ai.actions] Gemini quota exceeded while generating insights:", modelError);

                const fallback = buildFallbackInsights(
                    book.title,
                    book.author,
                    segments.map((s: any) => String(s.content || ""))
                );

                await Book.updateOne({ _id: bookId }, {
                    insights: fallback.insights,
                    knowledgeMap: fallback.knowledgeMap,
                    flashcards: fallback.flashcards,
                });

                return {
                    success: true,
                    insights: fallback.insights,
                    knowledgeMap: fallback.knowledgeMap,
                    flashcards: fallback.flashcards,
                    warning: "Gemini quota exceeded. A local fallback summary was generated.",
                };
            }

            throw modelError;
        }
        
        // Extraction with fallback and JSON cleaning
        let parsed: any;
        try {
            // Remove markdown code blocks if they exist
            const cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
            const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
            
            if (!jsonMatch) {
                console.error("[ai.actions] No JSON structure in response:", response);
                throw new Error("No JSON found in AI response");
            }
            
            parsed = JSON.parse(jsonMatch[0]);
            console.log("[ai.actions] Gemini response parsed successfully for insights");
        } catch (parseError) {
            console.error("[ai.actions] Failed to parse Gemini response for insights:", response);
            return { 
                success: false, 
                error: "We've experienced a slight hiccup analyzing the node. Please try again." 
            };
        }

        // Validate required fields
        if (!parsed.insights || !parsed.knowledgeMap || !Array.isArray(parsed.flashcards)) {
            return { success: false, error: "AI provided incomplete data. We will work on this." };
        }

        await Book.updateOne({ _id: bookId }, {
            insights: parsed.insights,
            knowledgeMap: parsed.knowledgeMap,
            flashcards: parsed.flashcards
        });

        return { 
            success: true, 
            insights: parsed.insights, 
            knowledgeMap: parsed.knowledgeMap,
            flashcards: parsed.flashcards 
        };

    } catch (error: any) {
        console.error("Error generating insights:", error);

        if (isGeminiQuotaError(error)) {
            return {
                success: false,
                error: "Gemini API quota exceeded (429). Enable billing or wait for quota reset, then retry.",
            };
        }

        return { 
            success: false, 
            error: error instanceof Error ? error.message : "We've experienced a slight hiccup. We will work on this." 
        };
    }
}

export const extractContentFromFile = async (fileUrl: string, fileName: string, fileType: string) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Fetch the file content
        const response = await fetch(fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const base64Content = Buffer.from(arrayBuffer).toString('base64');

        const prompt = `
        You are an expert document analyzer. Extract the text content from this file: "${fileName}".
        If it's an image, perform OCR. If it's a document (DOCX/PPTX), extract all readable text.
        Format the output as a JSON object with:
        1. "content": The extracted text content.
        2. "suggestedTitle": A clean title for this document.
        3. "summary": A brief (100-200 chars) summary/gist of the content for a preview.
        4. "visualTheme": Choose one keyword that best represents the visual "mood" of the content: 'minimal', 'vibrant', 'dark', 'tech', 'nature', 'industrial', 'academic', or 'artistic'.
        
        Strict JSON format only.
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Content,
                    mimeType: fileType
                }
            }
        ]);

        const aiResponse = result.response.text();
        console.log("[ai.actions] Raw AI response from extractContentFromFile:", aiResponse);

        let parsed: any;
        try {
            const cleanedResponse = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
            
            if (!jsonMatch) {
                console.error("[ai.actions] No JSON found in extraction response:", aiResponse);
                throw new Error("No JSON found in AI response");
            }
            
            parsed = JSON.parse(jsonMatch[0]);
            console.log("[ai.actions] Extraction content parsed successfully");
        } catch (e: any) {
            console.error("[ai.actions] Extraction parse error:", e.message, aiResponse);
            throw new Error("Failed to parse extracted content. AI response was not in valid JSON format.");
        }

        // Split into segments
        const { splitIntoSegments } = await import("@/lib/utils");
        const segments = splitIntoSegments(parsed.content);

        return {
            success: true,
            data: {
                content: segments,
                title: parsed.suggestedTitle || fileName.replace(/\.[^/.]+$/, ""),
                summary: parsed.summary,
                visualTheme: parsed.visualTheme || 'minimal'
            }
        };

    } catch (error) {
        console.error("Error extracting content from file:", error);
        return { success: false, error: "Failed to process file with AI" };
    }
}

export const generateNodeCover = async (theme: string) => {
    const themes: Record<string, string> = {
        minimal: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=1000&auto=format&fit=crop', // Minimal lamp
        vibrant: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop', // Abstract colorful
        dark: 'https://images.unsplash.com/photo-1514332042231-897db4652c42?q=80&w=1000&auto=format&fit=crop', // Dark textured
        tech: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop', // Circuit/Tech
        nature: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1000&auto=format&fit=crop', // Forest
        industrial: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop', // Concrete Architecture
        academic: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1000&auto=format&fit=crop', // Library books
        artistic: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1000&auto=format&fit=crop', // Abstract paint
    };

    return themes[theme] || themes.minimal;
};
