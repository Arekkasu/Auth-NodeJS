import { Request, Response } from "express";
import { CreateCategoryDto, CustomError, PaginationDto } from "../../domain";
import { CategoryService } from "../services/category.service";
import { CreateProductDto } from "../../domain/dtos/products/create-product.dto";
import { ProductService } from "../services/product.service";

export class ProductController {
  constructor(private productService: ProductService) {}

  private handleErrors = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error("Internal server error", error);
    return res.status(500).json({ error: "Internal server error" });
  };

  createProduct = (req: Request, res: Response) => {
    const [error, createProductDto] = CreateProductDto.create({
      ...req.body,
      user: req.body.user.id,
    });
    if (error) return res.status(400).json({ error });

    this.productService
      .createProduct(createProductDto!)
      .then((category) => res.status(201).json(category))
      .catch((error) => this.handleErrors(error, res));
  };

  getProducts = async (req: Request, res: Response) => {
    //PAGINACION

    //ADQUIRIDIO EN LA URL /page
    const { page = 1, limit = 10 } = req.query;
    const [error, paginationDto] = PaginationDto.create(+page, +limit);
    console.log(error);
    if (error) return res.status(400).json({ error });
    this.productService
      .getProducts(paginationDto!)
      .then((categories) => {
        console.log(categories);
        res.json(categories);
      })
      .catch((error) => this.handleErrors(error, res));
  };
}
