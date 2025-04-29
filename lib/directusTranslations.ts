import { type components } from "@/types/api-collection";

type TranslationCore = {
  languages_code?: string | components["schemas"]["ItemsLanguages"] | null;
};

type PropsWithTranslations<T extends TranslationCore, TProps extends T> = {
  translations?: (number | T)[] | null | undefined;
} & TProps;

export function translateDirectusProps<
  T extends TranslationCore,
  TProps extends T,
>(
  untranslatedProps: PropsWithTranslations<T, TProps>,
  lang: string | undefined,
): PropsWithTranslations<T, TProps> {
  const { translations } = untranslatedProps;

  const translation = translations?.find(
    (translation) =>
      typeof translation === "object" &&
      typeof translation.languages_code === "string" &&
      translation.languages_code === lang,
  );

  if (typeof translation !== "object") {
    console.warn(
      `[translateDirectusProps] Translation for language "${lang}" was not found, using untranslated props.`,
      translations,
    );

    return untranslatedProps;
  }

  return {
    ...untranslatedProps,
    ...translation,
  };
}
