import { UploadedFile } from "express-fileupload";
import path from "path";
import fs from "fs";
import { Uuid } from "../../config";
import { CustomError } from "../../domain";
export class FileUploadService {
  constructor(private readonly uuid = Uuid.uuidv4) {}

  private checkFolder(folderPath: string) {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
  }

  async uploadSingle(
    file: UploadedFile,
    folder: string = "uploads",
    validExtensions: string[] = ["png", "jpg", "jpeg", "gif"],
  ) {
    try {
      //CONSTANTES DE ARCHIVO EXTENSION
      //COROT CIRCUTIO EN CASO QUE SEA UN NULL
      const fileExtension = file.mimetype.split("/").at(1) ?? "";
      console.log(fileExtension);
      if (!validExtensions.includes(fileExtension)) {
        throw CustomError.badRequest(`Invalid extension: ${fileExtension}`);
      }
      const destination = path.resolve(__dirname, "../../../", folder);
      this.checkFolder(folder);
      //NOMBRANDO EL ARCHIVO
      const fileName = `${this.uuid()}.${fileExtension}`;
      file.mv(`${destination}/${fileName}`);
      return { fileName };
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
  async uploadMultiply(
    files: UploadedFile[],
    folder: string = "uploads",
    validExtensions: string[] = ["png", "jpg", "jpeg", "gif"],
  ) {
    try{
      console.log(files)
      const fileNames = await Promise.all(
        files.map( file => this.uploadSingle(file,folder,validExtensions))
      )
      return {fileNames}
    }catch(error){
      console.log(error)
      throw error
    }
  }
}
