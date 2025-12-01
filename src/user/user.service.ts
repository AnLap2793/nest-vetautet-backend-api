import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';
import { User } from 'src/user/entities/user.entity';
import { DbService } from 'src/db/db.service';

@Injectable()
export class UserService {
  @Inject(DbService)
  dbService: DbService;

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async register(registerUserDto: RegisterUserDto) {
    const user = new User();
    user.accountname = registerUserDto.accountname;
    user.password = registerUserDto.password;

    //save file
    await this.dbService.write(user);
    return user;
  }
}
