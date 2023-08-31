import fs from 'fs';
import path from 'path';

const BASE_PATH = `./Templates/`;

export default async function readTemplate(fileName: string, parameters: Object={}){
    const filePath = path.join(__dirname, `${BASE_PATH}${fileName}`);
    let data = await fs.readFileSync(filePath, 'utf-8');
    //let ur = `${req.protocol}://${req.headers.host}/api/v1/auth/confirmEmail/${token}`;
    Object.keys(parameters).forEach((key)=>{
        data = data.replace(key, parameters[key]);
    });

    return data;

}