import { CategoryModel } from "../../data/mongo/models/category.model";
import { CreateCategoryDto, CustomError, PaginationDto } from "../../domain";
import { UserEntity } from "../../domain/entities/user.entity";

export class CategoryService {
  consturctur() {}
  async createCategory(createCategoryDto: CreateCategoryDto, user: UserEntity) {
    const categoryExists = await CategoryModel.findOne({
      name: createCategoryDto.name,
    });
    if (categoryExists) {
      throw CustomError.badRequest("Category already exists");
    }
    try {
      const category = new CategoryModel({
        ...createCategoryDto,
        user: user.id,
      });

      await category.save();

      return {
        id: category.id,
        name: category.name,
        available: category.avalaible,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getCategories(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    try {
      //SKIP ES PROPIEDAD DE MONGOOSE
      // PAGE-1 PARA CONTAR DEL 0 AL 10
      // PORQUE SKIP SALTA LO N DOCUMENTOS DEFINIDOS
      //const total = await CategoryModel.countDocuments();
      //const categories = await CategoryModel.find().skip((page-1) * limit).limit(limit);

      const [categories, total] = await Promise.all([
        CategoryModel.find()
          .skip((page - 1) * limit)
          .limit(limit),
        CategoryModel.countDocuments(),
      ]);

      return categories.map((category) => ({
        page,
        limit,
        total,
        next: `/api/categories?page=${page + 1}&limit=${limit}`,
        previous:
          page - 1 > 0
            ? `/api/categories?page=${page - 1}&limit=${limit - 1}`
            : null,
        id: category.id,
        name: category.name,
        available: category.avalaible,
      }));
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }
}
