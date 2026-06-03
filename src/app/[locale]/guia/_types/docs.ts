export interface ContentBlock {
  type:
    | "text"
    | "heading"
    | "list"
    | "image"
    | "gif"
    | "video"
    | "callout"
    | "stepper"
    | "action_button"
    | "divider"
    | "code";
  id?: string;
  content?: string;
  level?: 1 | 2 | 3;
  items?: string[];
  ordered?: boolean;
  src?: string;
  alt?: string;
  caption?: string;
  videoUrl?: string;
  severity?: "info" | "success" | "warning" | "error";
  title?: string;
  steps?: { label: string; description: string }[];
  buttonText?: string;
  route?: string;
  variant?: "contained" | "outlined";
  language?: string;
}

export interface Section {
  id: string;
  title: string;
}

export interface Chapter {
  id: string;
  title: string;
  sections: Section[];
  content: ContentBlock[];
}

export interface Module {
  id: string;
  title: string;
  icon: string;
  chapters: Chapter[];
}
