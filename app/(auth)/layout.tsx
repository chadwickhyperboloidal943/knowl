const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 sm:p-10">
      <div className="relative z-10 w-full max-w-fit">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
