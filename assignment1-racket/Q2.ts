import * as R from 'ramda'

// Q2.1
export interface NumberTree {
    root: number;
    children: NumberTree[];
}

export const sumTreeIf: (t:NumberTree,f:(x:number)=>boolean)=>number=
(t,f)=>{
    let predicatedSum:number=R.reduce((acc:number,cur:NumberTree) => acc+sumTreeIf(cur,f),0,t.children);
    if(f(t.root)) return predicatedSum+t.root;
    else return predicatedSum;
}

// Q2.2
export interface WordTree {
    root: string;
    children: WordTree[];
}

export const sentenceFromTree:(t:WordTree)=>string=
(t)=>{
    return t.root+" "+R.reduce((acc:string,cur:WordTree)=> acc+sentenceFromTree(cur),"",t.children);
}

// Q2.3
export interface Grade {
    course: string;
    grade: number;
}

export interface Student {
    name: string;
    gender: string;
    grades: Grade[];
}

export interface SchoolClass {
    classNumber: number;
    students: Student[];
}

// Q2.3.1
export function hasSomeoneFailedBiology(School){
    let studentsInSchool = School.reduce((acc,curr) => acc.concat(curr.students),[]);
    let gradesInSchool = studentsInSchool.reduce((acc,curr) => acc.concat(curr.grades),[]);
    let gradesFailedInBiology = gradesInSchool.filter(bGrade => bGrade.grade<56 && bGrade.course==='biology')
    if(gradesFailedInBiology.length===0)
        return false;
    return true;
}

// Q2.3.2
export function allGirlsPassMath(School){
    let studentsInSchool = School.reduce((acc,curr) => acc.concat(curr.students),[]);
    let girlsInSchool=studentsInSchool.filter(student => student.gender === 'Female');
    let girlsGradesInSchool = girlsInSchool.reduce((acc,curr) => acc.concat(curr.grades),[]);
    let gradesPassedInMath = girlsGradesInSchool.filter(bGrade => bGrade.grade>=56 && bGrade.course==='math')
    if(gradesPassedInMath.length === girlsInSchool.length)
        return true;
    return false;
}

// Q2.4

// ******************* YMDDate *******************//
export interface YMDDate {
    year: number;
    month: number;
    day: number;
}

export const makeYMDDate = (year: number, month: number, day: number): YMDDate =>
({year: year, month: month, day: day});

export const comesBefore: (date1: YMDDate, date2: YMDDate) => boolean = (date1, date2) => {
    if (date1.year < date2.year)
        return true;
    if (date1.year === date2.year && date1.month < date2.month) 
        return true;
    if (date1.year === date2.year && date1.month === date2.month && date1.day < date2.day) 
        return true;
    return false;
}

// ******************* paymentMethod *******************//
type PaymentMethod = Cash | DebitCard | Wallet;

// ******************* ChargeResult *******************//
export interface ChargeResult {
    amountLeft: number;
    wallet: Wallet;
}
//constructor
export const makeChargeResult = (amountLeft: number, wallet: Wallet): ChargeResult =>
({amountLeft: amountLeft, wallet: wallet});

// ******************* Cash *******************//
export interface Cash{
    tag: "cash";
    amount: number;
}
//constructor
export const makeCash = (amount: number): Cash =>
({ tag: "cash", amount: amount});
//type predicate
export const isCash = (x: PaymentMethod): x is Cash => x.tag === "cash";

// ******************* DebitCard *******************//
export interface DebitCard{
    tag: "dc";
    amount: number;
    expirationDate: YMDDate;
}
//constructor
export const makeDebitCard = (amount: number, expirationDate: YMDDate): DebitCard =>
({tag: "dc", amount: amount, expirationDate: expirationDate});
//type predicate
export const isDebitCard = (x: PaymentMethod): x is DebitCard => x.tag === "dc";

// ******************* Wallet *******************//
export interface Wallet{
    tag: "wallet";
    paymentMethods: PaymentMethod[] ;
}
//constructor
export const makeWallet = (paymentMethods: PaymentMethod[]): Wallet =>
({ tag: "wallet",paymentMethods: paymentMethods});
//type predicate
export const isWallet = (x: PaymentMethod): x is DebitCard => x.tag === "wallet";

// ******************* charge *******************//
export const charge = (paymentMethod: PaymentMethod, amount: number,today: YMDDate) : ChargeResult  => {
    if(isCash(paymentMethod)) // if the payment is with cash
        return amount <= paymentMethod.amount ? // if there are enough money
            makeChargeResult(0, makeWallet([makeCash(paymentMethod.amount - amount)])) : 
            makeChargeResult(amount-paymentMethod.amount, makeWallet([makeCash(0)]));
    else if (isDebitCard(paymentMethod)) // if the payment is with DebitCard
            if(comesBefore(today, paymentMethod.expirationDate)) // if the expirationDate isn't over yet
                return amount <= paymentMethod.amount ? // if there is enough money
                   makeChargeResult(0, makeWallet([makeDebitCard(paymentMethod.amount - amount,paymentMethod.expirationDate)])):
                   makeChargeResult(amount-paymentMethod.amount, makeWallet([makeDebitCard(0,paymentMethod.expirationDate)]));
            else // // if the expirationDate is over 
                return makeChargeResult(amount,makeWallet([paymentMethod]));
    else if(isWallet(paymentMethod)) // if the payment is with Wallet
            return paymentMethod.paymentMethods.reduce((acc,curr) => {
                const result : ChargeResult = charge(curr, acc.amountLeft, today);
                return makeChargeResult(result.amountLeft,makeWallet(acc.wallet.paymentMethods.concat(result.wallet.paymentMethods)));
            }, makeChargeResult(amount,makeWallet([])));
    else null; 
}