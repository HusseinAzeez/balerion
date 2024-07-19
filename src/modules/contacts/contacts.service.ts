import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateContactDto } from './dto/create-contact.dto';
import { Repository } from 'typeorm';
import { Contact } from '@/db/entities/contact.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class ContactsService {
  constructor(
    private readonly emailService: EmailService,

    @InjectRepository(Contact)
    private readonly contactsRepository: Repository<Contact>,
  ) {}
  async create(createContactDto: CreateContactDto) {
    const createContact = this.contactsRepository.create(createContactDto);
    const contact = await this.contactsRepository.save(createContact);

    await this.emailService.sendContact(createContact);
    return contact;
  }
}
