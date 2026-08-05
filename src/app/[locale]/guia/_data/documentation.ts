import { documentationDataPT } from "./documentation-pt";
import { documentationDataEN } from "./documentation-en";

export const getDocumentationData = (locale: string) => {
  if (locale === 'en') {
    return documentationDataEN;
  }
  return documentationDataPT;
};
