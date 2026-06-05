export const generateOTP = () => {
    const otp = Math.floor(1000 + Math.floor(Math.random() * 9000)).toString();
    console.log(otp);
    return otp;
}