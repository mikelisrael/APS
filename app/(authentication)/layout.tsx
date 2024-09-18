import React from "react";
import LightDarkSwitch from "./_components/light-dark-switch";

const AuthLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <>
  <div className="fixed bottom-10 left-5 rounded-md sm:left-10">
        <LightDarkSwitch />
      </div>{children}</>;
};

export default AuthLayout;
