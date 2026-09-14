export const translateToEnglish = async (
  text: string,
  sourceLanguage: string
): Promise<string> => {
  if (!text.trim()) {
    return "";
  }

  const url =
    `https://api.mymemory.translated.net/get` +
    `?q=${encodeURIComponent(text)}` +
    `&langpair=${encodeURIComponent(sourceLanguage)}|en` +
    `&mt=1`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Translation request failed");
  }

  const data = await response.json();

  if (data.responseStatus !== 200) {
    throw new Error(
      data.responseData?.translatedText ||
        "Translation failed"
    );
  }

  return data.responseData.translatedText;
};