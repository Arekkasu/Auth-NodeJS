export class CreateCategoryDto {
  private constructor(
    public readonly name: string,
    public readonly avaliable: boolean,
  ) {}

  static create(object: { [key: string]: any }): [string?, CreateCategoryDto?] {
    const { name, available = false } = object;
    let availableBool = available;
    if (!name) {
      return ["name is required"];
    }
    if (typeof available !== "boolean") {
      availableBool = available === "true";
    }
    return [undefined, new CreateCategoryDto(name, availableBool)];
  }
}
