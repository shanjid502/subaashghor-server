import express from 'express';
import { AddressControllers } from './address.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.get('/', auth('customer', 'admin'), AddressControllers.getAddresses);
router.post('/', auth('customer', 'admin'), AddressControllers.addAddress);
router.put('/:id', auth('customer', 'admin'), AddressControllers.updateAddress);
router.delete('/:id', auth('customer', 'admin'), AddressControllers.deleteAddress);
router.post('/:id/default', auth('customer', 'admin'), AddressControllers.setDefaultAddress);

export const AddressRoutes = router;
