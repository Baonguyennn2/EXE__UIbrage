const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticate: auth } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Ensure handlers exist before defining routes to avoid crash
if (postController.getAllPosts) router.get('/', postController.getAllPosts);
if (postController.getPostById) router.get('/:id', postController.getPostById);

if (auth && postController.createPost) {
  router.post('/', auth, upload.single('coverImage'), postController.createPost);
}
if (auth && postController.uploadPostImage) {
  router.post('/upload-image', auth, upload.single('image'), postController.uploadPostImage);
}
if (auth && postController.addComment) {
  router.post('/:postId/comments', auth, postController.addComment);
}

module.exports = router;
