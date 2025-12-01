import { Inject, Injectable } from '@nestjs/common';
import { writeFile } from 'fs/promises';
import { DbModuleOptions } from 'src/db/db.module';

@Injectable()
export class DbService {
  @Inject('OPTIONS')
  private options: DbModuleOptions;

  async write(obj: Record<string, any>) {
    //save database options
    await writeFile(this.options.path, JSON.stringify(obj || []), {
      encoding: 'utf8',
    });
  }
}
