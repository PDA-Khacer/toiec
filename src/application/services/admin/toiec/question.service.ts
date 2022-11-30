import {Count, Filter, repository, Where} from '@loopback/repository';
import {bind} from '@loopback/context';
import {
  QuestionRepository,
} from '../../../../infrastructure/repositories';
import {QuestionFactoryService} from '../../../../domain/services/toiec/question-factory.service';
import {
  Question,
} from '../../../../domain/models/toiec/question.model';
import {service} from '@loopback/core';

@bind()
export class QuestionService {
  constructor(
    @repository(QuestionRepository)
    private questionRepository: QuestionRepository,

    @service(QuestionFactoryService)
    private questionFactoryService: QuestionFactoryService,
  ) {
  }

  public async createQuestion(
    values: Omit<Question, 'id'>,
  ): Promise<Question> {
    // check
    // const self = await this.getSelf(idSelf);
    const product = await this.questionFactoryService.buildQuestion(values);
    return this.questionRepository.create(product);
  }

  public async getById(id: number): Promise<Question> {
    // check
    // await this.getSelf(idSelf);
    return this.questionRepository.findById(id);
  }

  public async get(
    filter?: Filter<Question>,
  ): Promise<Array<Question>> {
    // check
    // await this.getSelf(idSelf);
    return this.questionRepository.find(filter);
  }

  public async count( where?: Where<Question>): Promise<Count> {
    // check
    // await this.getSelf(idSelf);
    return this.questionRepository.count(where);
  }

  public async updateQuestion(
    id: number,
    value: Question,
  ): Promise<boolean> {
    // check
    // await this.getSelf(idSelf);
    // lock
    await this.questionRepository
      .updateById(id, value);
    return true;
  }
}
