% Signature: append(List1, List2, List3)/3
% Purpose: All elements in List1 appear in List2 in some (possibly different) order.
append([],Xs,Xs).
append([X|Xs],Ys,[X|Zs]) :- append(Xs,Ys,Zs).

% Signature: contained(List1, List2)/2
% Purpose: All elements in List1 appear in List2 in some (possibly different) order.
% Precondition: List2 is fully instantiated
% Example:
% ?- contained(X, [1, 2]).
% X = [1, 2];
% X = [2, 1];
% X = [1];
% X = [2];
contained([],_).
contained([X|Xs],[X|Ls1]) :- contained(Xs,Ls1).
contained([X|Xs],[Y|Ls1]) :- contained([X],Ls1), append(Ls2,[X|Ls3],[Y|Ls1]), append(Ls2,Ls3,Ls4), contained(Xs,Ls4).





