import React from "react";
import LightDarkSwitch from "./_components/light-dark-switch";

const AuthLayout = ({
  children
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="hidden md:block">
      <div className="fixed bottom-10 left-5 z-10 rounded-md bg-background sm:left-10">
        <LightDarkSwitch />
      </div>
      {children}
    </div>
  );
};

export default AuthLayout;
