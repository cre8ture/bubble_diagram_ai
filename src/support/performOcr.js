import { createWorker } from "tesseract.js";


export async function performOCR(imageData) {
    console.log("performOCR", imageData);
  const worker = await createWorker({
    logger: (m) => {
      console.log("mmmmmm",m);
    },
  });
 console.log("IMAGEDATA ", imageData);
  await worker.load();
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  const {
    data: { text },
  } = await worker.recognize(imageData);

  return text;
}

