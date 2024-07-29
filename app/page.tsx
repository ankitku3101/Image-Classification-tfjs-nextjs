'use client';
import React, { useState, useEffect } from 'react';
import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs';

export default function Home() {
  const [img, setImg] = useState<File | null>(null);
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
  const [modelLoading, setModelLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  async function loadModel() {
    console.log('Model Loading');
    const mobilenetModel = await mobilenet.load();
    setModel(mobilenetModel);
    setModelLoading(false);
    setProgress(100);
    console.log('Model Loaded');
  }

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (modelLoading) {
      interval = setInterval(() => {
        setProgress((prev) => (prev < 95 ? prev + 5 : prev));
      }, 100);
    }

    loadModel();

    return () => {
      clearInterval(interval);
    };
  }, [modelLoading]);

  const handleImgUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    if (!target.files) return;
    const image = target.files[0];
    classifyImage(image);
    setImg(image);
  };

  async function classifyImage(image: File) {
    if (!model) {
      console.error('Model is not loaded yet.');
      return;
    }

    const img = new Image();
    img.src = URL.createObjectURL(image);
    img.onload = async () => {
      const predictions = await model.classify(img);
      const predictionElement = document.getElementById('prediction');
      if (predictionElement) {
        predictionElement.innerHTML = `${predictions
          .map((p) => `${p.className}: ${p.probability.toFixed(2)}%`)
          .join('<br />')}`;
      }
    };
  }

  return (
    <div className='flex flex-col justify-center items-center h-screen'>
      {modelLoading ? (
        <div className='flex flex-col items-center'>
          <div className='text-center mb-4'>Loading model, please wait...</div>
          <div className='w-3/4 bg-gray-200 rounded-full h-2'>
            <div className='bg-blue-500 h-2 rounded-full' style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      ) : (
        <>
          <div className='flex flex-col justify-center items-center -mt-10'>
            <div className='text-4xl font-semibold'>Image Classification</div>            
            <div className='text-sm'>Upload an image, and the model will classify what is it</div>            
            <div className='flex flex-row gap-10 m-10'>
              <div>
                  <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-96 h-96 border-gray-300 rounded-xl cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                          </svg>
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span></p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">File type: SVG, PNG or JPG</p>
                      </div>
                      <input onChange={handleImgUpload} id="dropzone-file" type="file" className="hidden" />
                  </label>
              </div> 
              <div className=' bg-gray-200 h-96 w-96 border rounded-xl border-gray-300 flex items-center justify-center'>
                {img && <img src={URL.createObjectURL(img)} alt='upload-preview' style={{ maxWidth: '100%', maxHeight: '100%' }} />}
              </div>
            </div>
            <div className='h-10 text-center'>
              <div className='text-lg font-semibold'>Predicitions</div>
              <p id='prediction'></p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
