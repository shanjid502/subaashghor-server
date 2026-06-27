import express from 'express';
import { NewslatterControllers } from './newslatter.controller';

const router = express.Router();

router.post('/', NewslatterControllers.createNewslatter);
router.get('/', NewslatterControllers.getAllNewslatters);
router.get('/:id', NewslatterControllers.getSingleNewslatter);
router.patch('/:id', NewslatterControllers.updateNewslatter);
router.delete('/:id', NewslatterControllers.deleteNewslatter);

export const NewslatterRoutes = router;
