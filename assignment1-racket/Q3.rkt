#lang racket

(provide (all-defined-out))

;; Signature: ngrams(list-of-symbols, n)
;; Purpose: Return a list of consecutive n symbols
;; Type: [List(Symbol) * Number -> List(List(Symbol))]
;; Precondition: n <= length(list-of-symbols)
;; Tests: (ngrams '(the cat in the hat) 3) => '((the cat in) (cat in the) (in the hat))
;;        (ngrams '(the cat in the hat) 2) => '((the cat) (cat in) (in the) (the hat))
(define ngrams
  (lambda (los n)
    (if (< n 0)
        '()
    (if (empty? los)
        '()
        (cons (partOfTheList los n)
              (ngrams (if(< (length (cdr los)) n)
                                          '()
                                          (cdr los))
                                       n))))))

;; Signature: partOfTheList(list-of-symbols, nSplit)
;; Purpose: Return the first n characters in the list-of-symbols
;; Type: [List(Symbol) * Number -> List(Symbol)]
;; Precondition: nSplit <= length(list-of-symbols)
;; Tests: (partOfTheList '(the cat in the hat) 3) => '(the cat in)
;;        (partOfTheList '(cat in the hat) 2) => '(cat in)
(define partOfTheList
  (lambda (los nSplit)
    (if(or (zero? nSplit) (empty? los)) 
       '()
       (cons (car los) (partOfTheList (cdr los) (- nSplit 1))))))

;; Signature: ngrams-with-padding(list-of-symbols, n)
;; Purpose: Return a list of consecutive n symbols, padding if necessary
;; Type: [List(Symbol) * Number -> List(List(Symbol))]
;; Precondition: n <= length(list-of-symbols)
;; Tests: (ngrams-with-padding '(the cat in the hat) 3) => '((the cat in) (cat in the) (in the hat) (the hat *) (hat * *))
;;        (ngrams-with-padding '(the cat in the hat) 2) => '((the cat) (cat in) (in the) (the hat) (hat *))
(define ngrams-with-padding
  (lambda (los n)
    (if (<= n 0)
        '()
    (ngrams (concateStars los (- n 1)) n))))

;; Signature: concateStars(list-of-symbols, amount)
;; Purpose: Return the los list concatenated to the received amount of stars
;; Type: [List(Symbol) * Number -> List(Symbol)]
;; Precondition: amount>=0
;; Tests: (concateStars '(the cat in the hat) 3) => '(the cat in the hat * * *)

(define concateStars
  (lambda (los amount)
    (if (zero? amount)
        los
        (concateStars (append los '(*)) (- amount 1)))))