// run.ts
import ora from 'ora';

async function runTask() {
  const spinner = ora('Loading...').start();

  setTimeout(() => {
    spinner.succeed('Task complete');
  }, 2000);
}

runTask();

// import { oraPromise } from 'ora';

// const done = true;

// const isItDoneYet = new Promise((resolve, reject) => {
//   if (done) {
//     const workDone = 'Here is the thing I built';

//     setTimeout(() => {
//       resolve(workDone);
//     }, 5000);
//   } else {
//     const why = 'Still working on something else';

//     reject(why);
//   }
// });

// const run = async () => {
//   await oraPromise(isItDoneYet, 'Reading file...');

//   await oraPromise(isItDoneYet, 'Reading file...');
// };

// run();
