export const excludeFieldsFromDb = (data: any, fields: string[]) => {
  fields.forEach((field) => {
    delete data[field];
  });
  return data;
};
