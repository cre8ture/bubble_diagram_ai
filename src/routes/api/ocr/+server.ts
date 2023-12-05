// import {performOcr} from "../../../support/performOCR";
import { createWorker } from "tesseract.js";

function logger(m) {
    console.log(m);
  }

export async function POST({ request }) {
    // console.log("POST", request)
    const formData = await request.formData();
    // console.log("POST3", formData)

    const file = formData.get('image');
    if (file) {
      const imageData = await file.arrayBuffer(); 
    //   const text = await performOcr(imageData);
    // console.log("performOCR", imageData);
    // const worker = await createWorker({
    //   logger: (m) => {
    //     console.log("mmmmmm",m);
    //   },
    // });

    const worker = await createWorker();
   console.log("IMAGEDATA ", imageData);
    // await worker.load();
    // await worker.loadLanguage("eng");
    // await worker.initialize("eng");
    const {
      data: { text },
    } = await worker.recognize(imageData);

    
if(!text) {
    text = 'No text extracted';
  }
  
//   return {
//     status: 200,
//     body: JSON.stringify({text}),
//     headers: {
//       'Content-Type': 'application/json'
//     }
//   };
  return new Response(JSON.stringify({text}), {
    headers: {
        'Content-Type': 'application/json'
    }
})
  
}
  

    return {
      status: 400
    };
  }