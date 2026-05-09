import express from 'express';
import { ProfileControllers } from './profile.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.get('/', auth('customer', 'admin'), ProfileControllers.getAddresses);
router.post('/', auth('customer', 'admin'), ProfileControllers.addAddress);
router.put('/:id', auth('customer', 'admin'), ProfileControllers.updateAddress);
router.delete('/:id', auth('customer', 'admin'), ProfileControllers.deleteAddress);
router.post('/:id/default', auth('customer', 'admin'), ProfileControllers.setDefaultAddress);

export const AddressRoutes = router;
