const Jimp = require('jimp');
const inquirer = require('inquirer');
const fs = require('fs');
const { brightness } = require('jimp');

const addTextWatermarkToImage = async function (inputFile, outputFile, text, bright, contrast, greyscale, invert) {
     try {
          const image = await Jimp.read(inputFile);
          image.brightness(Number(bright));
          image.contrast(Number(contrast));
          greyscale && image.greyscale();
          invert && image.invert();
          const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

          const textData = {
               text,
               alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
               alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
          };

          image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
          await image.quality(100).writeAsync(outputFile);
          console.log('Added TextWatermark to image');
          startApp();
     }
     catch (error) {
          console.log(error);
     }
};

const addImageWatermarkToImage = async function (inputFile, outputFile, watermarkFile, bright, contrast, greyscale, invert ) {
     try {
          const image = await Jimp.read(inputFile);
          image.brightness(Number(bright));
          image.contrast(Number(contrast));
          greyscale && image.greyscale();
          invert && image.invert();

          const watermark = await Jimp.read(watermarkFile);
          const x = image.getWidth() / 2 - watermark.getWidth() / 2;
          const y = image.getHeight() / 2 - watermark.getHeight() / 2;

          image.composite(watermark, x, y, {
               mode: Jimp.BLEND_SOURCE_OVER,
               opacitySource: 0.5,
          });

          await image.quality(100).writeAsync(outputFile);
          console.log('Added ImageWatermark to image');
          startApp();
     }
     catch (error) {
          console.log(error);
     }
};

const startApp = async () => {
     const prepareOutputFilename = (filename) => {
          const [ name, ext ] = filename.split('.');
          return `${name}-with-watermark.${ext}`;
     };

  // Ask if user is ready
     const answer = await inquirer.prompt([{
          name: 'start',
          message: 'Hi! Welcome to "Watermark manager". Copy your image files to `/img` folder. Then you\'ll be able to use them in the app. Are you ready?',
          type: 'confirm'
     }]);

  // if answer is no, just quit the app
     if(!answer.start) process.exit();

  // ask about input file and watermark type
     const options = await inquirer.prompt([{
          name: 'inputImage',
          type: 'input',
          message: 'What file do you want to mark?',
          default: 'test.jpg',
     },
     {
          name: 'watermarkType',
          type: 'list',
          choices: ['Text watermark', 'Image watermark'],
          },
     {
               name: 'editphoto',
               type: 'confirm',
               message: 'Do you want edit photo?',
          },
          {
               name: 'brighter',
               type: 'input',
               message: 'How much do you want to make image brighter? (-1 to 1)',
          },
          {
               name: 'contrast',
               type: 'input',
               message: 'How much do you want to increase contrast? (-1 to 1)',
          },
          {
               name: 'greyscale',
               type: 'confirm',
               message: 'Do you want make image b&w?',
          },
          {
               name: 'invert',
               type: 'confirm',
               message: 'Do you want make image invert?',
          }]);
          let brightValue = options.brighter;
          let contrastValue = options.contrast;
          let greyscale = options.greyscale;
          let invert = options.invert;

     if(options.watermarkType === 'Text watermark') {
          const text = await inquirer.prompt([{
               name: 'value',
               type: 'input',
               message: 'Type your watermark text:',
          },
          ]);
          options.watermarkText = text.value;

          let fileExists = fs.existsSync(`./img/${options.inputImage}`);
          if (!fileExists) {
               console.log("Something went wrong... Try again")
               process.exit();
          }

          addTextWatermarkToImage('./img/' + options.inputImage, './img/' + prepareOutputFilename(options.inputImage), options.watermarkText, brightValue, contrastValue, greyscale, invert);
     }
     else {
          const image = await inquirer.prompt([{
               name: 'filename',
               type: 'input',
               message: 'Type your watermark name:',
               default: 'logo.png',
          }]);

          options.watermarkImage = image.filename;

          let fileImageExists = fs.existsSync(`./img/${options.inputImage}`);
          let watermarkImageExists = fs.existsSync(`./img/${options.watermarkImage}`);
          if (!fileImageExists || !watermarkImageExists) {
               console.log("Something went wrong... Try again")
               process.exit();
          }

     addImageWatermarkToImage('./img/' + options.inputImage, './img/' + prepareOutputFilename(options.inputImage), './img/' + options.watermarkImage, brightValue, contrastValue, greyscale, invert);
     }

}

startApp();