import path from 'path';
import fs from 'fs';

export function collectEndpoints(): {}[] {

    const dirname = __dirname.replace('/Utils', '');
    const routesPath = path.join(dirname, 'Routes'); 
    const routeFiles = fs.readdirSync(routesPath);
    //console.log(routeFiles)
    
    const endpoints: {}[] = [];

    routeFiles.forEach((ControllerName) => {
        ControllerName = ControllerName.split('.')[0];
        endpoints.push({
            name: ControllerName,
            endpoints: [
                ControllerName+'Create',
                ControllerName+'Update',
                ControllerName+'GetAll',
                ControllerName+'GetOne',
                ControllerName+'Delete'
            ]
        });
    });
  
    return endpoints;
  }

//   function getAllEndpoints(router: Router, basePath = ''): string[] {
//     // const endpoints: string[] = [];
//     // console.log(router);
//     // router.stack.forEach((layer) => {
//     //     console.log(layer)
//     //   if (layer.route) {
//     //     const routePath = `${basePath}${layer.route.path}`;
//     //     endpoints.push(routePath);
//     //   } else if (layer.name === 'router') {
//     //     const nestedRouter = layer.handle as Router;
//     //     const nestedEndpoints = getAllEndpoints(nestedRouter, basePath + layer.path);
//     //     endpoints.push(...nestedEndpoints);
//     //   }
//     // });
//     const endpoints: string[] = [];
//     router.stack.forEach((layer: any) => {
//   if (layer.route) {
//     // Route path
//     const path = layer.route.path;

//     // Router name
//     const routerName = layer.route.path.includes('/:')
//       ? layer.route.path.split('/:')[0]
//       : layer.route.path.split('/')[0];

//     // HTTP methods
//     const methods = Object.keys(layer.route.methods).join(', ');

//     endpoints.push(`${routerName}${path}`);
//   }});
  
//     return endpoints;
//   }


// function collectEndpoints(): string[] {
//     const routesPath = path.join(__dirname, 'Routes'); // Path to the 'routes' folder
//     const routeFiles = fs.readdirSync(routesPath);
//     console.log(routeFiles)
//     const endpoints: string[] = [];
  
//     routeFiles.forEach((file) => {
//       const router = require(path.join(routesPath, file)).default;
  
//       if (router && router.stack) {
//         router.stack.forEach((layer: any) => {
//           if (layer.route) {
//             const path = layer.route.path;
//             const methods = Object.keys(layer.route.methods).join(', ');
  
//             endpoints.push(`${methods}: ${path}`);
//           }
//         });
//       }
//     });
  
//     return endpoints;
//   }