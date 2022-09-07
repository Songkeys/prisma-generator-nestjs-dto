import { ImportStatementParams } from './types';
import { getCustomAnnotations } from './field-classifiers';
import { DMMF } from '@prisma/generator-helper';
import { DtoType, splitDecorator } from './validator-helpers';

export const CUSTOM_IMPORT_PATH_REGEX = new RegExp(
  `\\{(?:(.+)\\s?,?\\s?)+}$`,
  'i',
);

const splitImportPath = (decorator: string) => {
  const customImport = decorator.match(CUSTOM_IMPORT_PATH_REGEX);
  return customImport === null
    ? [decorator, '']
    : [decorator.replace(CUSTOM_IMPORT_PATH_REGEX, ''), customImport[1]];
};

export const getCustomImportAnnotations = (
  field: DMMF.Field | DMMF.Model,
  type: DtoType,
): [string[], ImportStatementParams[]] => {
  const decorators = [];
  const imports: Record<string, string[]> = {};
  for (const [decorator, imp] of getCustomAnnotations(field)) {
    const [annotation, importPath] = splitImportPath(decorator);
    const [deco, types] = splitDecorator(annotation);
    if (types === '' || types.toUpperCase().includes(type)) {
      decorators.push(deco);
      imports[importPath] = [...(imports[importPath] || []), imp];
    }
  }
  const importParams = Object.keys(imports).reduce<ImportStatementParams[]>(
    (acc, importPath) => [
      ...acc,
      { from: importPath, destruct: imports[importPath] },
    ],
    [],
  );
  return [decorators, importParams];
};
