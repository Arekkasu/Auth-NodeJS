import { Router } from "express";
import { FileUploadController } from "./controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { ProductService } from "../services/product.service";
import { FileUploadService } from "../services/file-upload.service";
import { FileUploadMiddleware } from "../middlewares/fileupload.middleware";
import { TypeMiddleware } from "../middlewares/type.middleware";

export class FileUploadRoutes {
  static get routes(): Router {
    const router = Router();
    const service = new FileUploadService();
    const controller = new FileUploadController(service);
    router.use(FileUploadMiddleware.containFiles);
    // DE ESTA MANERA NO SE SABE DE DONDE VIENE LA PETICION ES DECIR PUEDE HACERSE A UN GET O POST
    // POR LO QUE SE EDITA MIDDLEWARE PARA VALIDAR DESDE URL REQ.
    router.use(TypeMiddleware.validTypes(["users", "products", "categories"]));
    router.post("/single/:type", controller.uploadFile);
    router.post("/multiple/:type", controller.uploadMultiplyFiles);
    return router;
  }
}
