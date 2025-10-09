export interface Website {
  title?: string;
  url?: string;
}

export interface Experience {
  position: string;
  company: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
}

export interface Education {
  institution: string;
  degree: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
}

export interface Profile {
  about?: string;
  email?: string;
  website?: Website;
  skills?: string[];
  experiences?: Experience[];
  education?: Education[];
}
