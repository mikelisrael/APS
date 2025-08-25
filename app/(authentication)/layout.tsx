import React from "react";
import LightDarkSwitch from "./_components/light-dark-switch";

const AuthLayout = ({
  children
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <main className="h-svh">
      <div className="fixed bottom-10 left-5 rounded-md sm:left-10">
        <LightDarkSwitch />
      </div>
      {children}
    </main>
  );
};

export default AuthLayout;
