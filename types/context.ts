export interface IAppContext {
  user: IUser | null;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
}

export interface IUser {
  name?: string;
  email?: string;
}
