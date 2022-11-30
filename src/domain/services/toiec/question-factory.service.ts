import {repository} from '@loopback/repository';
import {bind} from '@loopback/context';
import {QuestionRepository} from '../../repositories/toiec/question.repository';
import {Question} from '../../models/toiec/question.model';

@bind()
export class QuestionFactoryService {
  constructor(
    @repository('QuestionRepository')
    private questionRepository: QuestionRepository,
  ) {}

  public async buildQuestion(
    values: Pick<Question, 'content'>,
  ): Promise<Question> {
    return new Question({
      ...values,
    });
  }
}
