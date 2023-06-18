import * as tf from "@tensorflow/tfjs"
import { useEffect, useState } from "react"
import "./tensor.css"

export default function Tensor(){
    const [model, setModel]= useState(null);
    const [imagenInput, setImagenInput]=useState(null)
    const [prediccion, setPrediccion]=useState(null)
    console.log("2")
    useEffect(()=>{
        async function cargarModelo(){
            const modelo= await tf.loadLayersModel("model.json")
            console.log("MODELO?", modelo)
            setModel(modelo)
        }
        console.log("MODELO?", modelo)
        cargarModelo()
        console.log("1")
    }, [])

    const handleImageUpload = async (event) => {
        console.log(event.target.files[0])
        if(!event.target.files[0])return
        // Obtiene la imagen cargada
        const file = event.target.files[0];
        setImagenInput(URL.createObjectURL(event.target.files[0]))
        //Manda la imagen para preprocesarla al formato que acepta el modelo
        const imagen = await cargarImagen(file);

        // Realizar la predicción
        const prediccion = model.predict(imagen);

        // Obtiene los resultados de la prediccion
        const prediccionData = await prediccion.data();

        // Determinar la clase
        const clases = ['gatos', 'perros'];
        const predictedClase = clases[prediccionData[0] > 0.5 ? 1 : 0];

        // Mostrar la predicción
        console.log('Prediction:', predictedClase);
        setPrediccion(predictedClase)
        
    };

    const cargarImagen=async(file)=>{
        console.log("4")
        const image = new Image();
        const reader = new FileReader();

        return new Promise((resolve, reject) => {
            reader.onload = function (event) {
                image.onload = function () {
                // Preprocesar la imagen aquí
                const preprocessedImage = preprocessImage(image);

                resolve(preprocessedImage);
                };

                image.src = event.target.result;
            };

            reader.readAsDataURL(file);
        });
    }


    const preprocessImage = (image) => {
        // Se define el ancho y la altura que acepta el modelo para las imagenes
        const width = 64;
        const height = 64;
        console.log("5")
        // Creamos un canvas para poder modificar la imagen
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, width, height);
      
        // Obtener los datos de píxeles preprocesados
        const imageData = context.getImageData(0, 0, width, height);
        const data = imageData.data;
      
        // Normalizar los valores de píxeles
        const normalizarPixeles = [];
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
      
          // Normalizar los valores de píxeles en el rango [0, 1]
          const normalizedR = r / 255;
          const normalizedG = g / 255;
          const normalizedB = b / 255;
      
          // Agregar los valores normalizados al arreglo de píxeles
          normalizarPixeles.push(normalizedR, normalizedG, normalizedB);
        }
      
        // Crear un tensor de TensorFlow.js a partir de los datos de píxeles preprocesados
        const preprocessedTensor = tf.tensor(normalizarPixeles, [1, width, height, 3]);
        return preprocessedTensor;
      };

    const handleCancelar = ()=>{
        setImagenInput(null)
        setPrediccion(null)
    }
    return (
        <div className="contenedor">
            {imagenInput!==null? <img src={imagenInput} className="imagen"></img> : null}
            <input type="file" onChange={handleImageUpload} id="file-input" className="inp" accept="image/*" style={{ display: "none" }} onCancel={handleCancelar}/>
            <label htmlFor="file-input" className="inp-label">Seleccionar imagen</label>
            {prediccion!==null? <label className="prediccion">{prediccion}</label> : null}
        </div>
    )

}
