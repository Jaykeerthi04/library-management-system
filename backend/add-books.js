const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Book = require("./models/Book");

dotenv.config({ path: require("path").join(__dirname, ".env") });

const books = [
  { title: "Brave New World", author: "Aldous Huxley", category: "Fiction" },
  { title: "The Catcher in the Rye", author: "J. D. Salinger", category: "Fiction" },
  { title: "Pride and Prejudice", author: "Jane Austen", category: "Fiction" },
  { title: "Moby-Dick", author: "Herman Melville", category: "Fiction" },
  { title: "Crime and Punishment", author: "Fyodor Dostoevsky", category: "Fiction" },
  { title: "War and Peace", author: "Leo Tolstoy", category: "Fiction" },
  { title: "The Hobbit", author: "J. R. R. Tolkien", category: "Fiction" },
  { title: "The Lord of the Rings", author: "J. R. R. Tolkien", category: "Fiction" },
  { title: "The Picture of Dorian Gray", author: "Oscar Wilde", category: "Fiction" },
  { title: "Wuthering Heights", author: "Emily Bronte", category: "Fiction" },
  { title: "The Lean Startup", author: "Eric Ries", category: "Business" },
  { title: "Zero to One", author: "Peter Thiel", category: "Business" },
  { title: "Good to Great", author: "Jim Collins", category: "Business" },
  { title: "The Psychology of Money", author: "Morgan Housel", category: "Business" },
  { title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", category: "Business" },
  { title: "Deep Work", author: "Cal Newport", category: "Self-Help" },
  { title: "The Power of Habit", author: "Charles Duhigg", category: "Self-Help" },
  { title: "The 7 Habits of Highly Effective People", author: "Stephen R. Covey", category: "Self-Help" },
  { title: "Mindset", author: "Carol S. Dweck", category: "Self-Help" },
  { title: "Grit", author: "Angela Duckworth", category: "Self-Help" },
  { title: "The Art of War", author: "Sun Tzu", category: "History" },
  { title: "Guns, Germs, and Steel", author: "Jared Diamond", category: "History" },
  { title: "A Short History of Nearly Everything", author: "Bill Bryson", category: "History" },
  { title: "The Silk Roads", author: "Peter Frankopan", category: "History" },
  { title: "Team of Rivals", author: "Doris Kearns Goodwin", category: "History" },
  { title: "Introduction to Algorithms", author: "Thomas H. Cormen", category: "Technology" },
  { title: "Refactoring", author: "Martin Fowler", category: "Technology" },
  { title: "Head First Design Patterns", author: "Eric Freeman", category: "Technology" },
  { title: "You Don't Know JS Yet", author: "Kyle Simpson", category: "Technology" },
  { title: "Python Crash Course", author: "Eric Matthes", category: "Technology" },
  { title: "Eloquent JavaScript", author: "Marijn Haverbeke", category: "Technology" },
  { title: "Hands-On Machine Learning", author: "Aurelien Geron", category: "Technology" },
  { title: "The Mythical Man-Month", author: "Frederick P. Brooks Jr.", category: "Technology" },
  { title: "The Clean Coder", author: "Robert C. Martin", category: "Technology" },
  { title: "Code Complete", author: "Steve McConnell", category: "Technology" },
  { title: "The Selfish Gene", author: "Richard Dawkins", category: "Science" },
  { title: "Cosmos", author: "Carl Sagan", category: "Science" },
  { title: "The Gene", author: "Siddhartha Mukherjee", category: "Science" },
  { title: "Brief Answers to the Big Questions", author: "Stephen Hawking", category: "Science" },
  { title: "The Elegant Universe", author: "Brian Greene", category: "Science" },
  { title: "The Man Who Knew Infinity", author: "Robert Kanigel", category: "Biography" },
  { title: "Steve Jobs", author: "Walter Isaacson", category: "Biography" },
  { title: "Long Walk to Freedom", author: "Nelson Mandela", category: "Biography" },
  { title: "Wings of Fire", author: "A. P. J. Abdul Kalam", category: "Biography" },
  { title: "The Diary of a Young Girl", author: "Anne Frank", category: "Biography" },
  { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", category: "Psychology" },
  { title: "Man's Search for Meaning", author: "Viktor E. Frankl", category: "Psychology" },
  { title: "Influence", author: "Robert B. Cialdini", category: "Psychology" },
  { title: "Predictably Irrational", author: "Dan Ariely", category: "Psychology" },
  { title: "Flow", author: "Mihaly Csikszentmihalyi", category: "Psychology" },
  { title: "The Name of the Wind", author: "Patrick Rothfuss", category: "Fantasy" },
  { title: "Mistborn", author: "Brandon Sanderson", category: "Fantasy" },
  { title: "The Way of Kings", author: "Brandon Sanderson", category: "Fantasy" },
  { title: "American Gods", author: "Neil Gaiman", category: "Fantasy" },
  { title: "The Lies of Locke Lamora", author: "Scott Lynch", category: "Fantasy" },
  { title: "Dune", author: "Frank Herbert", category: "Science Fiction" },
  { title: "Foundation", author: "Isaac Asimov", category: "Science Fiction" },
  { title: "Neuromancer", author: "William Gibson", category: "Science Fiction" },
  { title: "Snow Crash", author: "Neal Stephenson", category: "Science Fiction" },
  { title: "The Martian", author: "Andy Weir", category: "Science Fiction" },
];

async function addBooks() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const operations = books.map((book, index) => {
      const serial = String(index + 1).padStart(4, "0");
      const isbn = `LIB-2026-${serial}`;
      const quantity = (index % 5) + 2;

      return {
        updateOne: {
          filter: { isbn },
          update: {
            $set: {
              title: book.title,
              author: book.author,
              category: book.category,
              quantity,
              available: quantity,
            },
            $setOnInsert: { isbn },
          },
          upsert: true,
        },
      };
    });

    const beforeCount = await Book.countDocuments();
    const result = await Book.bulkWrite(operations, { ordered: false });
    const afterCount = await Book.countDocuments();

    console.log("Books bulk upsert complete");
    console.log(`Matched: ${result.matchedCount}`);
    console.log(`Modified: ${result.modifiedCount}`);
    console.log(`Inserted: ${result.upsertedCount}`);
    console.log(`Total books before: ${beforeCount}`);
    console.log(`Total books after: ${afterCount}`);
  } catch (error) {
    console.error("Failed to add books:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

addBooks();
