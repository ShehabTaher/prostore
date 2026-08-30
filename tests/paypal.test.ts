import { generateAccessToken, paypal } from '../lib/paypal'

// Test to generate access token from Paypal
test('should generate access token from Paypal', async () => {
  const accessToken = await generateAccessToken()
  console.log(accessToken)
  expect(typeof accessToken).toBe('string')
  expect(accessToken.length).toBeGreaterThan(0)
})

// Test to create order from Paypal
test('should create order from Paypal', async () => {
  const price = 10.0

  const orderResponse = await paypal.createOrder(price)

  expect(orderResponse).toHaveProperty('id')
  expect(orderResponse).toHaveProperty('status')
  expect(orderResponse.status).toBe('CREATED')
})

// test to capture payment with mock Paypal
test('should capture payment with mock Paypal', async () => {
  const orderId = '100'

  const mockCapturePayment = jest
    .spyOn(paypal, 'capturePayment')
    .mockResolvedValue({
      id: orderId,
      status: 'COMPLETED',
    })

  const captureResponse = await paypal.capturePayment(orderId)
  expect(captureResponse).toHaveProperty('status', 'COMPLETED')

  mockCapturePayment.mockRestore()
})
