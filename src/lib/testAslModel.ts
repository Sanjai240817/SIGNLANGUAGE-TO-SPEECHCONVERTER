import { checkASLModel } from "./aslModels";

export async function testASLModel() {
  const ok = await checkASLModel();
  console.log(ok ? "✅ ASL model loaded" : "❌ ASL model failed");
}