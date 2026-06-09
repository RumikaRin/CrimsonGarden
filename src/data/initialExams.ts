import { Exam } from '../types';

export const initialExams: Exam[] = [
  {
    id: 'exam-eng-1',
    title: 'Đề Ôn Tập Trắc Nghiệm Tiếng Anh THPT Quốc Gia - Đề Số 1',
    description: 'Đề thi trắc nghiệm thử nghiệm kiểm tra ngữ pháp tiếng Anh, các thì cơ bản, từ vựng và câu bị động.',
    duration: 15,
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: 'q1',
        content: 'She ______ her homework before she went to bed last night.',
        points: 2,
        order: 1,
        explanation: 'Thì Quá khứ hoàn thành (had driven/done) diễn tả hành động xảy ra trước một hành động khác trong quá khứ (went to bed).',
        answers: [
          { id: 'a1_1', content: 'finished', isCorrect: false },
          { id: 'a1_2', content: 'has finished', isCorrect: false },
          { id: 'a1_3', content: 'had finished', isCorrect: true },
          { id: 'a1_4', content: 'was finishing', isCorrect: false }
        ]
      },
      {
        id: 'q2',
        content: 'If I ______ you, I would study harder for the upcoming examination.',
        points: 2,
        order: 2,
        explanation: 'Câu điều kiện loại 2 diễn tả giả định không có thực ở hiện tại. Mệnh đề IF dùng động từ "were" cho tất cả các ngôi.',
        answers: [
          { id: 'a2_1', content: 'am', isCorrect: false },
          { id: 'a2_2', content: 'was', isCorrect: false },
          { id: 'a2_3', content: 'were', isCorrect: true },
          { id: 'a2_4', content: 'had been', isCorrect: false }
        ]
      },
      {
        id: 'q3',
        content: 'Find the synonym of the word "abundant":',
        points: 2,
        order: 3,
        explanation: '"Abundant" có nghĩa là dồi dào, phong phú, đồng nghĩa với "plentiful". các từ khác nghĩa là: khan hiếm (scarce), nhỏ bé (tiny), thiếu thốn (lacking).',
        answers: [
          { id: 'a3_1', content: 'scarce', isCorrect: false },
          { id: 'a3_2', content: 'plentiful', isCorrect: true },
          { id: 'a3_3', content: 'tiny', isCorrect: false },
          { id: 'a3_4', content: 'lacking', isCorrect: false }
        ]
      },
      {
        id: 'q4',
        content: 'The passive voice of "They built this school in 2020" is:',
        points: 2,
        order: 4,
        explanation: 'Câu chủ động ở thì Quá khứ đơn: S + V-ed + O. Chuyển sang bị động: O + was/were + V3/V-ed. Đáp án đúng là "This school was built in 2020".',
        answers: [
          { id: 'a4_1', content: 'This school is built in 2020.', isCorrect: false },
          { id: 'a4_2', content: 'This school has been built in 2020.', isCorrect: false },
          { id: 'a4_3', content: 'This school was built in 2020.', isCorrect: true },
          { id: 'a4_4', content: 'This school built in 2020.', isCorrect: false }
        ]
      },
      {
        id: 'q5',
        content: 'Which word has a different pronunciation in the underlined part? (ch_aracter, ch_air, ch_urch, ch_at)',
        points: 2,
        order: 5,
        explanation: '"character" phát âm là /k/, trong khi "chair", "church", "chat" phát âm là /tʃ/.',
        answers: [
          { id: 'a5_1', content: 'character', isCorrect: true },
          { id: 'a5_2', content: 'chair', isCorrect: false },
          { id: 'a5_3', content: 'church', isCorrect: false },
          { id: 'a5_4', content: 'chat', isCorrect: false }
        ]
      }
    ]
  },
  {
    id: 'exam-vocab-2',
    title: 'Đề Kiểm Tra Từ Vựng Tiếng Anh Giao Tiếp - Chủ Đề Đời Sống',
    description: 'Đề kiểm tra nhanh các từ vựng thông dụng về chủ đề đời sống, công sở và giao tiếp xã hội.',
    duration: 10,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    questions: [
      {
        id: 'qv1',
        content: 'Choose the correct meaning of "Collaborate":',
        points: 2.5,
        order: 1,
        explanation: '"Collaborate" có nghĩa là cùng làm việc với người khác, hợp tác sản xuất hoặc tạo ra thứ gì đó.',
        answers: [
          { id: 'av1_1', content: 'Phản đối ý kiến người khác', isCorrect: false },
          { id: 'av1_2', content: 'Hợp tác, làm việc chung', isCorrect: true },
          { id: 'av1_3', content: 'Trì hoãn thời gian làm bài', isCorrect: false },
          { id: 'av1_4', content: 'Huỷ bỏ dự án đột xuất', isCorrect: false }
        ]
      },
      {
        id: 'qv2',
        content: 'What is the English word for "Sự kiên trì"?',
        points: 2.5,
        order: 2,
        explanation: '"Persistence" hoặc "Perseverance" có nghĩa là sự kiên trì, nỗ lực bền bỉ.',
        answers: [
          { id: 'av2_1', content: 'Perseverance', isCorrect: true },
          { id: 'av2_2', content: 'Hesitation', isCorrect: false },
          { id: 'av2_3', content: 'Ignorance', isCorrect: false },
          { id: 'av2_4', content: 'Complacency', isCorrect: false }
        ]
      },
      {
        id: 'qv3',
        content: 'He is very ______; he always pays close attention to minor details.',
        points: 2.5,
        order: 3,
        explanation: 'Người chú ý từng chi tiết nhỏ gọi là người tỉ mỉ, kỹ lưỡng (meticulous). các từ khác nghĩa là: bất cẩn (careless), lười biếng (lazy), bất hoà (stubborn).',
        answers: [
          { id: 'av3_1', content: 'careless', isCorrect: false },
          { id: 'av3_2', content: 'meticulous', isCorrect: true },
          { id: 'av3_3', content: 'stubborn', isCorrect: false },
          { id: 'av3_4', content: 'apathetic', isCorrect: false }
        ]
      },
      {
        id: 'qv4',
        content: 'What does "procrastinate" mean?',
        points: 2.5,
        order: 4,
        explanation: '"Procrastinate" nghĩa là trì hoãn, khất lần, để lùi việc lại sau.',
        answers: [
          { id: 'av4_1', content: 'Làm việc năng suất', isCorrect: false },
          { id: 'av4_2', content: 'Trì hoãn, khất việc', isCorrect: true },
          { id: 'av4_3', content: 'Huấn luyện kỹ năng', isCorrect: false },
          { id: 'av4_4', content: 'Học hỏi không ngừng', isCorrect: false }
        ]
      }
    ]
  }
];
