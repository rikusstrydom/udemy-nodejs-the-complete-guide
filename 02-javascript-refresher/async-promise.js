const fetchData = () => {
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('done')
    }, 1500);
  });
  return promise;
}

setTimeout(() => {
  console.log('Timer is done');

  fetchData()
  .then((res) => {
    console.log(res);
    return fetchData();
  })
  .then(res2 => {
    console.log(res2);
  });

}, 2000);