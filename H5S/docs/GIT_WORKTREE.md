# Hướng Dẫn Sử Dụng Git Worktree (GIT_WORKTREE.md)

Tài liệu này hướng dẫn sử dụng **Git Worktree** để cách ly môi trường làm việc khi nhiều Agent (Coder + Tester) chạy song song trên cùng một repository.

---

## 🎯 1. VẤN ĐỀ

Khi 2 Agent sửa cùng repository cùng lúc:
- Xung đột file → mất code.
- Branch collision → stash bị ghi đè.
- Dependency state không nhất quán → test sai.

**Giải pháp:** Mỗi Agent làm việc trên một **worktree riêng** — cùng `.git` history nhưng khác thư mục và branch.

---

## 🔧 2. CÁC LỆNH CƠ BẢN

### Tạo worktree cho Agent

```bash
# Tạo worktree cho Coder trên branch feature
git worktree add ../H5S-coder feature/feat-001-auth

# Tạo worktree cho Tester trên branch test
git worktree add ../H5S-tester test/feat-001-auth
```

### Liệt kê worktree đang hoạt động

```bash
git worktree list
# Output:
# <project-root>             abc1234 [main]
# ../project-coder           def5678 [feature/feat-001]
# ../project-tester          ghi9012 [test/feat-001]
```

### Xóa worktree khi hoàn thành

```bash
git worktree remove ../H5S-coder
git worktree remove ../H5S-tester
```

---

## 🔄 3. LUỒNG LÀM VIỆC VỚI AGENT TEAM

```text
Leader (main workspace: <project-root>)
    │
    ├── Tạo worktree cho Coder
    │   git worktree add ../H5S-coder feature/<branch>
    │
    ├── Tạo worktree cho Tester
    │   git worktree add ../H5S-tester test/<branch>
    │
    ├── Coder làm việc tại ../H5S-coder
    │   └── Commit → Push branch feature
    │
    ├── Tester làm việc tại ../H5S-tester
    │   └── Commit → Push branch test
    │
    ├── Reviewer review cả 2 branch
    │
    └── Leader merge vào main khi pass review
        git worktree remove ../H5S-coder
        git worktree remove ../H5S-tester
```

---

## ⚠️ 4. LƯU Ý QUAN TRỌNG

- **Không checkout cùng branch** trên 2 worktree — Git sẽ báo lỗi.
- **Chạy `npm install`** riêng trong mỗi worktree nếu có thay đổi `package.json`.
- **Prisma Client** cần `npx prisma generate` riêng trong mỗi worktree.
- **Không xóa worktree bằng `rm -rf`** — luôn dùng `git worktree remove`.
