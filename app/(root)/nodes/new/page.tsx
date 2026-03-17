import UploadForm from "@/components/UploadForm";
import BookPageAnimator from "@/components/BookPageAnimator";
import { Layers } from "lucide-react";

const Page = () => {
    return (
        <BookPageAnimator>
            <main className="new-book relative min-h-screen pt-40 pb-24 px-4">
                <section className="flex flex-col items-center gap-6 text-center mb-16 relative z-10">
                    <div className="size-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-4 transform -rotate-6">
                        <Layers size={40} className="text-white" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-serif font-black text-gray-900 dark:text-white tracking-tight">
                        Synthesize a <span className="text-indigo-600 dark:text-indigo-400">Node</span>
                    </h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
                        Upload any research paper, document, or knowledge resource and let Knowl's AI transform it into an interactive knowledge node.
                    </p>
                </section>

                <div className="relative z-10">
                    <UploadForm />
                </div>
            </main>
        </BookPageAnimator>
    );
};

export default Page;
