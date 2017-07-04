import pygame

class Square(object):

    

    def __init__(self):
        self.shape = [pygame.Rect([4 * self.side_length, -self.side_length, self.side_length, self.side_length]),
                            pygame.Rect([5 * self.side_length, -self.side_length, self.side_length, self.side_length]),
                            pygame.Rect([4 * self.side_length, 0, self.side_length, self.side_length]),
                            pygame.Rect([5 * self.side_length, 0, self.side_length, self.side_length])]
        self.rotations = []
    def rotate(self):

class Stick(object):



    def __init__(self):
        self.shape = [pygame.Rect([4 * self.side_length, -3 * self.side_length, self.side_length, self.side_length]),
                      pygame.Rect([4 * self.side_length, -2 * self.side_length, self.side_length, self.side_length]),
                      pygame.Rect([4 * self.side_length, -1 * self.side_length, self.side_length, self.side_length]),
                      pygame.Rect([4 * self.side_length, 0, self.side_length, self.side_length])]
        self.rotations = []
    def rotate(self):
