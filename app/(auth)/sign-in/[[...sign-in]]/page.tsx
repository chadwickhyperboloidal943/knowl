import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center space-y-3">
        <h1 className="text-4xl sm:text-5xl font-serif font-black text-gray-900 dark:text-white tracking-tight">
          Welcome <span className="text-indigo-600">Back</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xs mx-auto">
          Sign in to access your digital library and resume your AI conversations.
        </p>
      </div>
      
      <div className="premium-card p-2 sm:p-4 bg-white/40 dark:bg-[#141414]/40 backdrop-blur-2xl border-white/50 dark:border-white/5 shadow-2xl rounded-[2.5rem] scale-95 sm:scale-100 transition-all">
        <SignIn 
          routing="path" 
          path="/sign-in" 
          signUpUrl="/sign-up"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-transparent shadow-none border-none",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "rounded-2xl border-black/5 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all py-3",
              formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 rounded-2xl py-3.5 font-bold text-sm tracking-wide transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98]",
              formFieldInput: "bg-gray-50 dark:bg-white/5 border-black/5 dark:border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500/20",
              footerActionLink: "text-indigo-600 dark:text-indigo-400 font-bold hover:underline",
              dividerLine: "bg-black/5 dark:bg-white/10",
              dividerText: "text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest"
            }
          }}
        />
      </div>
    </div>
  );
}
