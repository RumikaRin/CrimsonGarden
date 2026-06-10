export interface BankAnswer {
  content: string;
  isCorrect: boolean;
}

export interface BankQuestion {
  content: string;
  explanation: string;
  points: number;
  answers: BankAnswer[];
}

export const questionBank: BankQuestion[] = [
  {
    content: "My sister is very fond ______ reading romantic novels in her free time.",
    explanation: "Cấu trúc 'be fond of + V-ing' nghĩa là thích làm gì đó, tương đương với 'be interested in' hoặc 'like'.",
    points: 2,
    answers: [
      { content: "of", isCorrect: true },
      { content: "in", isCorrect: false },
      { content: "at", isCorrect: false },
      { content: "with", isCorrect: false }
    ]
  },
  {
    content: "By the time the police arrived, the thieves ______ away with the jewelry.",
    explanation: "Mệnh đề thời gian dùng 'By the time' ở quá khứ đơn (arrived) thì mệnh đề chính dùng thì Quá khứ hoàn thành (had run) để diễn tả hành động xảy ra trước đó.",
    points: 2,
    answers: [
      { content: "had run", isCorrect: true },
      { content: "ran", isCorrect: false },
      { content: "has run", isCorrect: false },
      { content: "was running", isCorrect: false }
    ]
  },
  {
    content: "The heavy rain prevented us ______ going on our picnic last Sunday.",
    explanation: "Cấu trúc 'prevent someone from doing something' có nghĩa là ngăn cản ai làm việc gì.",
    points: 2,
    answers: [
      { content: "from", isCorrect: true },
      { content: "of", isCorrect: false },
      { content: "against", isCorrect: false },
      { content: "to", isCorrect: false }
    ]
  },
  {
    content: "The novel ______ by Charles Dickens is one of his most famous works.",
    explanation: "Đây là cấu trúc rút gọn mệnh đề quan hệ dạng bị động. Cụm gốc là 'which was written by...', khi rút gọn chỉ giữ lại quá khứ phân từ (written).",
    points: 2,
    answers: [
      { content: "written", isCorrect: true },
      { content: "writing", isCorrect: false },
      { content: "was written", isCorrect: false },
      { content: "which wrote", isCorrect: false }
    ]
  },
  {
    content: "If he had taken his doctor's advice, he ______ in the hospital now.",
    explanation: "Câu điều kiện hỗn hợp (loại 3 kết hợp loại 2) diễn tả giả định trái ngược quá khứ (had taken) dẫn đến kết quả trái ngược hiện tại (would not be ... now).",
    points: 2,
    answers: [
      { content: "would not be", isCorrect: true },
      { content: "would not have been", isCorrect: false },
      { content: "is not", isCorrect: false },
      { content: "will not be", isCorrect: false }
    ]
  },
  {
    content: "Which word has a different pronunciation of the underlined part? (honest, hour, heir, house)",
    explanation: "Trong các từ 'honest', 'hour', 'heir', âm 'h' là âm câm. Riêng trong 'house', âm 'h' được phát âm rõ ràng là /h/.",
    points: 2,
    answers: [
      { content: "house", isCorrect: true },
      { content: "honest", isCorrect: false },
      { content: "hour", isCorrect: false },
      { content: "heir", isCorrect: false }
    ]
  },
  {
    content: "She was ______ exhausted after a long day of work that she fell asleep on the couch.",
    explanation: "Cấu trúc 'so + adj + that + clause' diễn tả kết quả: quá đến nỗi mà. 'such' đi kèm với cụm danh từ.",
    points: 2,
    answers: [
      { content: "so", isCorrect: true },
      { content: "such", isCorrect: false },
      { content: "too", isCorrect: false },
      { content: "very", isCorrect: false }
    ]
  },
  {
    content: "He decided to buy the car ______ the high price.",
    explanation: "'Despite' (hoặc 'In spite of') được theo sau bởi danh từ hoặc cụm danh từ (the high price). 'Although' và 'Even though' cần đi kèm một mệnh đề.",
    points: 2,
    answers: [
      { content: "despite", isCorrect: true },
      { content: "in spite", isCorrect: false },
      { content: "although", isCorrect: false },
      { content: "even though", isCorrect: false }
    ]
  },
  {
    content: "It is important that he ______ the project before the deadline next week.",
    explanation: "Cấu trúc giả định (subjunctive mood) với mẫu câu 'It is important/necessary/vital that S + V(nguyên mẫu không to)'.",
    points: 2,
    answers: [
      { content: "submit", isCorrect: true },
      { content: "submits", isCorrect: false },
      { content: "submitted", isCorrect: false },
      { content: "will submit", isCorrect: false }
    ]
  },
  {
    content: "The price of oil has gone ______ due to the political instability in the Middle East.",
    explanation: "Cụm động từ 'go up' nghĩa là tăng lên. Các cụm khác: 'go down' (giảm), 'go off' (nổ bom, hư hỏng đồ ăn), 'go over' (xem lại).",
    points: 2,
    answers: [
      { content: "up", isCorrect: true },
      { content: "down", isCorrect: false },
      { content: "off", isCorrect: false },
      { content: "over", isCorrect: false }
    ]
  },
  {
    content: "No sooner ______ entered the room than the lights went out.",
    explanation: "Cấu trúc đảo ngữ: 'No sooner + had + S + V3/ed + than + clause' (Vừa mới... thì...).",
    points: 2,
    answers: [
      { content: "had he", isCorrect: true },
      { content: "he had", isCorrect: false },
      { content: "did he", isCorrect: false },
      { content: "he did", isCorrect: false }
    ]
  },
  {
    content: "They have been married for ten years, ______?",
    explanation: "Câu hỏi đuôi (tag question): Mệnh đề chính khẳng định ở hiện tại hoàn thành (have been) thì phần đuôi dùng trợ động từ phủ định 'haven't they'.",
    points: 2,
    answers: [
      { content: "haven't they", isCorrect: true },
      { content: "have they", isCorrect: false },
      { content: "aren't they", isCorrect: false },
      { content: "don't they", isCorrect: false }
    ]
  },
  {
    content: "Unless you study harder, you ______ pass the entrance examination.",
    explanation: "'Unless' tương đương với 'If ... not' (Nếu không). 'Nếu bạn không học chăm chỉ hơn, bạn sẽ không đỗ (won't pass)'",
    points: 2,
    answers: [
      { content: "won't", isCorrect: true },
      { content: "will", isCorrect: false },
      { content: "don't", isCorrect: false },
      { content: "wouldn't", isCorrect: false }
    ]
  },
  {
    content: "She works as a nurse in a big hospital, ______ she?",
    explanation: "Câu hỏi đuôi: Mệnh đề chính khẳng định dùng động từ thường chia ngôi số ít (works) thì phần hỏi đuôi mượn trợ động từ phủ định 'doesn't she'.",
    points: 2,
    answers: [
      { content: "doesn't", isCorrect: true },
      { content: "does", isCorrect: false },
      { content: "isn't", isCorrect: false },
      { content: "works", isCorrect: false }
    ]
  },
  {
    content: "The manager suggested ______ a short break after two hours of continuous meeting.",
    explanation: "Cấu trúc 'suggest + V-ing' nghĩa là đề xuất cùng thực hiện hành động gì đó.",
    points: 2,
    answers: [
      { content: "taking", isCorrect: true },
      { content: "to take", isCorrect: false },
      { content: "take", isCorrect: false },
      { content: "should take", isCorrect: false }
    ]
  },
  {
    content: "She has a ______ face that always makes people feel warm and welcome.",
    explanation: "Cần tính từ đứng trước danh từ 'face'. Từ 'friendly' là một tính từ (thân thiện) mặc dù có đuôi '-ly'.",
    points: 2,
    answers: [
      { content: "friendly", isCorrect: true },
      { content: "friend", isCorrect: false },
      { content: "friendliness", isCorrect: false },
      { content: "friended", isCorrect: false }
    ]
  },
  {
    content: "The children are highly excited ______ going to the zoo tomorrow.",
    explanation: "Cấu trúc 'be excited about something/doing something' có nghĩa là hào hứng, phấn khích về việc gì.",
    points: 2,
    answers: [
      { content: "about", isCorrect: true },
      { content: "with", isCorrect: false },
      { content: "of", isCorrect: false },
      { content: "for", isCorrect: false }
    ]
  },
  {
    content: "He has ______ experience in teaching English than his colleague.",
    explanation: "Từ 'experience' (kinh nghiệm) là danh từ không đếm được. Dùng 'less' cho so sánh hơn của danh từ không đếm được. 'fewer' chỉ dùng cho danh từ đếm được.",
    points: 2,
    answers: [
      { content: "less", isCorrect: true },
      { content: "fewer", isCorrect: false },
      { content: "little", isCorrect: false },
      { content: "least", isCorrect: false }
    ]
  },
  {
    content: "The active voice of 'The document was signed by the director' is:",
    explanation: "Câu bị động ở thì quá khứ đơn: 'was/were + V3/ed'. Chuyển lại câu chủ động tương ứng chia ở thì Quá khứ đơn: 'S + V2/ed + O' (The director signed...).",
    points: 2,
    answers: [
      { content: "The director signed the document.", isCorrect: true },
      { content: "The director was signing the document.", isCorrect: false },
      { content: "The director signs the document.", isCorrect: false },
      { content: "The director has signed the document.", isCorrect: false }
    ]
  },
  {
    content: "Which word has a different stress pattern? (promise, develop, invent, decide)",
    explanation: "Từ 'promise' nhấn trọng âm vào âm tiết thứ nhất (/ˈprɒm.ɪs/). Ba từ còn lại nhấn trọng âm vào âm tiết thứ hai: 'develop' (/dɪˈvel.əp/), 'invent' (/ɪnˈvent/), 'decide' (/dɪˈsaɪd/).",
    points: 2,
    answers: [
      { content: "promise", isCorrect: true },
      { content: "develop", isCorrect: false },
      { content: "invent", isCorrect: false },
      { content: "decide", isCorrect: false }
    ]
  }
];
