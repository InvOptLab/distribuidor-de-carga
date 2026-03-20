type Messages = typeof import("./messages/en.json");
type PtBrMessages = typeof import("./messages/pt-BR.json");

declare interface IntlMessages extends Messages {}
