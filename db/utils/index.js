// need to require in the premade data from the data folder

function convertTime(UNIX_timestamp) {
  // we need to make a function for our timestamp
  return new Date(UNIX_timestamp); // use the new date method and call it to the UNIX_timestamp argument
}

exports.makeArticle = function (articleData) {
  // need a make article function for our seed
  return articleData.map(
    // we use .map on each part of our article data
    ({ created_by, created_at, ...restOfData }) => ({
      // we pass through the created_by and created_out keys form the articleData object, then we use spread to push all the other keys into the remainingArticleData value
      username: created_by, // we set username to the created_by key so that each created by name is set to that value
      created_at: convertTime(created_at), // we set created at to be the time converter function we made above so that it will be the specific time
      ...restOfData, // then we just return in the rest of the data
    }),
  );
};

exports.makeComments = function (commentData, articleInfo) {
  // we need a make comments function
  return commentData.map(
    // we use .map on each comment passed through the premade data
    ({
      belongs_to, created_by, created_at, ...restOfComments
    }) => {
      // we want to pass through these 3 values along with the rest of the data that we have in the premade data
      const articleFiltered = articleInfo.filter(
        // make a variable for our filtered articles so that we can return it below
        article => article.title === belongs_to, // then we have each article and we want to filter through the title from the article
      );
      return {
        username: created_by, // we want to return username set to the created_by key again
        article_id: articleFiltered[0].article_id, // set the id of article to the start of the filtered article variables id
        created_at: convertTime(created_at), // we need to set the created at key to the time converter function from above
        ...restOfComments, // the last thing we need to return is the rest of the comment data so we call restOfComments
      };
    },
  );
};
