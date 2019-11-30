% Signature: parent(Parent, Child)/2
% Purpose: Parent is the parent of the child.

parent(abraham, isaac).
parent(isaac, jacob).
parent(sarah, isaac).
parent(jacob, joseph).
parent(rebbeca, esav).
parent(rebbeca,jacob).
parent(isaac, esav).

% Signature: male(Person)/1
% Purpose: The person is male.

male(abraham).
male(isaac).
male(joseph).

% Signature: female(Person)/1
% Purpose: The person is female.

female(sarah).
female(rebbeca).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%              Solution              %
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

% Signature: mother(Mother,child)/2
% Purpose: Mother is mother of child if Mother is a female and if Mother is the parent of the child.
mother(Mom,Son) :- female(Mom), parent(Mom,Son).

% Signature: father(Father,child)/2
% Purpose: Father is father  of child if Father is a male Father and if Father is the parent of the child.
father(Dad,Son) :- male(Dad), parent(Dad,Son).

% Signature: ancestor(A, D)/2
% Purpose: To check if there is a relationship of ancestor between A to D.
ancestor(A, D) :- parent(A, D).
ancestor(A, D) :- parent(A, Person), ancestor(Person, D).

% Signature: siblings(Person1, Person2)/2
% Purpose: Person1 and Person2 are siblings.
% Example:
% ?- siblings(X, Y).
% X = jacob, Y = esav;
% X = esav, Y = jacob
siblings(X, Y) :-
    mother(Mom,X), mother(Mom,Y), father(Dad,X), father(Dad,Y), X \= Y. 
            
% Signature: relatives(Person1, Person2)/2
% Purpose: Person1 and Person2 are relatives.
% Example:
% ?- relatives(isaac, Y).
% Y = jacob ;
% Y = esav ;
% Y = joseph ;
relatives(X, Y) :- ancestor(Person, Y), ancestor(Person, X), X \= Y.