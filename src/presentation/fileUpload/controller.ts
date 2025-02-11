import { Request, Response } from "express";
import { CustomError } from "../../domain";
import { FileUploadService } from "../services/file-upload.service";
import { UploadedFile } from "express-fileupload";

export class FileUploadController {
  constructor(private readonly fileUploadSevice: FileUploadService) {}

  private handleErrors = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error("Internal server error", error);
    return res.status(500).json({ error: "Internal server error" });
  };

  uploadFile = (req: Request, res: Response) => {
    const type = req.params.type;
    /* MINE: NO NECESARIO PORQUE SE MEJORO EN EL MIDDLEWARE 
    const validTypes = ["users", "products", "categories"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `invalid type: ${type}` });
    }
    */
    //const files = req.files;
    if (!req.files || Object.keys(req.files).length == 0) {
      return res.status(400).json({ error: "No files" });
    }
    //EL FILE DEBE LLAMARSE TAL Y COMO SALE EN EL NAME DE INPUT
    // EN POSTMAN PUSE H POR LO QEU DEBE SER REQ.FILES.H
    //
    // AHORA POR EL MIDDLEWARE ESTO QUEDO EN EL BODY, POR LO QUE ESE BODY TIENE UN ARREGLO LLAMADO FILES
    // DONDE AL SER SOLAMENTE UN ARCHIVO ENVIADO PUES SE ESCOGERA EL PRIMER INDICE
    const file = req.body.files.at(0) as UploadedFile;
    console.log("ARCHIVO", Object.keys(req.files));
    this.fileUploadSevice
      .uploadSingle(file, `uploads/${type}`)
      .then((uploaded) => res.json(uploaded))
      .catch((error) => this.handleErrors(error, res));
  };

  uploadMultiplyFiles = async (req: Request, res: Response) => {
    const type = req.params.type; 
    const file = req.body.files.at(0) as UploadedFile[];
    this.fileUploadSevice.uploadMultiply(file, `uploads/${type}`).then
      ((uploaded) => {res.json(uploaded)})
    .catch(error => this.handleErrors(error,res))
  };
}
