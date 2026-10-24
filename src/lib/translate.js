import axios from "axios";
import { config, translationEnabled } from "../config";

const TRANSLATE_URL = "https://translation.googleapis.com/language/translate/v2";

/** Translates text with the Google Cloud Translation API. Returns the original text when translation is off or fails. */
export async function translateText(text, target, signal) {
  if (!translationEnabled || !text) return text;
  try {
    const { data } = await axios.post(
      TRANSLATE_URL,
      { q: text, target, format: "text" },
      { params: { key: config.googleApiKey }, signal },
    );
    return data.data.translations[0].translatedText;
  } catch (error) {
    if (axios.isCancel(error)) throw error;
    return text;
  }
}
