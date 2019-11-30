#lang racket

; The empty lazy list value (a singleton datatype)
(define empty-lzl '())

; Signature: cons-lzl(x, lzl)
; Purpose: Value constructor for non-empty lazy-list values
; Type: [T * [Empty -> LZL(T)] -> LZT(T)]
(define cons-lzl cons)

; Accessors
; Signature: head(lz-list)
; Type: [LZL(T) -> T]
; Precondition: Input is non-empty
(define head car)

; Signature: tail(lz-list)
; Type: [LZL(T) -> LZL(T)]
; Precondition: Input is non-empty
; Note that this *executes* the continuation 
(define tail
  (lambda (lzl)
    ((cdr lzl))))

; Signature: empty-lzl?(exp)
; Type: [T -> Boolean]
; Type predicate
(define empty-lzl? empty?)

; Signature: take(lz-lst,n)
; Type: [LzL*Number -> List]
; If n > length(lz-lst) then the result is lz-lst as a List
(define take
  (lambda (lz-lst n)
    (if (or (= n 0) (empty-lzl? lz-lst))
      empty-lzl
      (cons (head lz-lst)
            (take (tail lz-lst) (- n 1))))))

; Signature: nth(lz-lst,n)
; Type: [LzL*Number -> T]
; Pre-condition: n < length(lz-lst)
(define nth
  (lambda (lz-lst n)
    (if (= n 0)
        (head lz-lst)
        (nth (tail lz-lst) (sub1 n)))))

; Signature: make-tree(1ist,..,list)
; Purpose: Creates new tree
; Type: [Tree(T)*Tree(T)*...*Tree(T)->Tree(T)]
(define make-tree list)

; Signature: add-subtree(subtree,tree)
; Purpose: Adds new subtree
; Type: [Tree(T)*Tree(T)->Tree(T)]
(define add-subtree cons)

; Signature: make-leaf(data)
; Purpose: Creates new leaf
; Type: [T->Tree(T)]
(define make-leaf (lambda (d) d))

; Signature: empty-tree(exp)
; Purpose: Checks if the input is an empty-tree
; Type: empty-Tree
(define empty-tree empty)

; Signature: first-subtree(tree)
; Purpose: Returns the first-subtree of the given tree
; Type: [Tree(T)->Tree(T)]
(define first-subtree car)

; Signature: rest-subtree(tree)
; Purpose: Returns the rest-subtree of the given tree 
; Type: [Tree(T)->Tree(T)]
(define rest-subtree cdr)

; Signature: leaf-data(leaf)
; Purpose: Returns the data of the given leaf
; Type: [Tree(T)->T]
(define leaf-data (lambda (x) x))

; Signature: composite-tree?(e)
; Type: [T->Boolean]
(define composite-tree? pair?)

; Signature: leaf?(exp)
; Purpose: Returns true if the input is a leaf, else returns false
; Type: [T->Boolean]
(define leaf? (lambda (t) (not (list? t))))

; Signature: empty-tree?(exp)
; Purpose: Returns true if the tree is empty, else returns false
; Type: [T->Boolean]
(define empty-tree? empty?)


; Signature: tree->leaves(tree)
; Purpos: Receives an unlabeled-tree parameter and
; returns an ordered list of the labels which appear in the leaves of the tree.
; Type: [Tree(T)->list]
; pre-condition: The input is a tree
; post-condition: Ordered list of the labels which appear in the leaves of the tree.
; Test: (tree->leaves '(a (b c)) ) -> '(a d c)
(define tree->leaves
  (lambda (lzl)
        (if(empty-tree? lzl)
           '()
           (if(leaf? lzl)
              (make-tree lzl)
              (append (tree->leaves (first-subtree lzl)) (tree->leaves (rest-subtree lzl)))
            )
         )
   )                    
)

; Signature: tree->lz-leaves(tree)
; Purpos: Receives an unlabeled-tree parameter and
; returns a lazy-list of the labels which appear in the leaves of the tree.
; Type: [Tree(T)->Lzl(T)]
; pre-condition: The input is a tree
; post-condition: Lazy-list of the labels which appear in the leaves of the tree.
(define tree->lz-leaves
  (lambda (lzl)
    (func-tree-lz-leaves (tree->leaves lzl))
  )
)

; Signature: func-tree-lz-leaves(tree)
; Purpos: The recursion of the function tree->lz-leaves
; Type: [Tree(T)->Lzl(T)]
; pre-condition: The input is a tree
(define func-tree-lz-leaves
  (lambda (treeLeaves)
        (if(empty-tree? treeLeaves)
           '()
           (cons-lzl (first-subtree treeLeaves) (lambda ()
                                            (func-tree-lz-leaves (rest-subtree treeLeaves)))
            )
        )
   )
)

; Signature: same-leaves?(lzlA, lzlB)
; Purpos: Receives two unlabeled-tree parameters and returns
; #t if they have the same leaves, otherwise a pair containing the first different labels in the
; lists of leaves.
; Type: [Tree(T)*Tree(T)->Boolean|Tree(T)]
; pre-condition: The input are trees 
; Test: (same-leaves? ‘((a b) c) ‘(a (b c))) -> #t
;       (same-leaves? ‘(a (b c)) ‘(a d c)) -> ‘(b . d)  
(define same-leaves?
  (lambda (lzlA lzlB)
    (func-same-leaves (tree->lz-leaves lzlA) (tree->lz-leaves lzlB))
  )
)

; Signature: func-same-leaves(lzlA, lzlB)
; Purpos: The recursion of the function tree->lz-leaves
; Type: [Tree(T)*Tree(T)->Boolean|Tree(T)]
; pre-condition: The input are trees
(define func-same-leaves
  (lambda (lzlA lzlB)
    (cond ((and (empty? lzlA) (empty? lzlB))
           #t)
          ((and (empty? lzlA) (not (empty? lzlB)))
           (cons '() (head lzlB) ))
          ((and (not (empty? lzlA)) (empty? lzlB))
           (cons (head lzlA) '() ))
          ((and (not (empty? lzlA)) (not (empty? lzlB)))
           (if (not (eq? (head lzlB) (head lzlA)))
                (cons (head lzlA) (head lzlB))
                (func-same-leaves (tail lzlA) (tail lzlB))
            )
           ) 
      )
   )
)